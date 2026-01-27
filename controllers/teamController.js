const Team = require("../models/Team");
const User = require("../models/User");
const TeamJoinRequest = require("../models/TeamJoinRequest");

exports.getAllTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; 
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';
    const sort = req.query.sort || 'name-asc';

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = {};
    switch (sort) {
      case 'name-asc': sortOption.name = 1; break;
      case 'name-desc': sortOption.name = -1; break;
      default: sortOption.name = 1;
    }

    const totalTeams = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const currentMonth = new Date().toISOString().slice(0, 7);

    await Promise.all(teams.map(async (team) => {
      team.currentMonthPoints = team.monthlyPoints.get(currentMonth) || 0;
      const ownerRecord = team.members.find(m => m.role === "owner");
      if (ownerRecord && ownerRecord.userId) {
        const user = await User.findById(ownerRecord.userId);
        team.ownerUsername = user ? user.name : "Nepoznat korisnik";
      } else {
        team.ownerUsername = "Nema vlasnika";
      }
      team.isUsersTeam = team.members.some(m => m.userId.toString() === req.session.user.id);
    }));

    const monthlyTopTeams = [...teams]
      .sort((a, b) => (b.currentMonthPoints || 0) - (a.currentMonthPoints || 0))
      .slice(0, 10);

    
    const userAlreadyInAnyTeam = await Team.exists({
      "members.userId": req.session.user.id
    });

    const totalPages = Math.ceil(totalTeams / limit);

    return res.render("teams/index", { 
      teams, 
      currentPage: page, 
      totalPages,
      totalTeams,
      userAlreadyInAnyTeam,
      search,
      sort,
      monthlyTopTeams
    });
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: "Greška na serveru!" });
  }
};


exports.getCreateTeam = async (req, res) => {
  try {
    const userAlreadyInAnyTeam = await Team.exists({
      "members.userId": req.session.user.id
    });
    if(userAlreadyInAnyTeam) {
      return res.redirect("/teams")
    }
    else {
      return res.render("teams/create");
    }
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.session.user.id;
    const existingTeam = await Team.findOne({ "members.userId": userId });
    if (existingTeam) {
      return res.status(403).render('error', { status: 403, message: "Ne možete kreirati tim dok ste član drugog tima." });
    }

    const owner = await User.findById(userId);
    if (!owner) return res.status(404).render('error', { status: 404, message: "Korisnik ne postoji!" });

    await Team.create({
      name: name,
      totalPoints: 0, 
      members: [{ userId: owner._id, role: "owner" }],
      monthlyPoints: {}
    });

    return res.redirect("/teams");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("members.userId", "name profilePicture");

    if (!team) return res.status(404).render('error', { status: 404, message: "Tim ne postoji!" });

    const userId = req.session.user.id;

    const userAlreadyInAnyTeam = await Team.exists({
        "members.userId": userId
    });

    const existingJoinRequest = await TeamJoinRequest.findOne({
        team: team._id,
        sender: userId,
        status: "pending"
    });

    const hasPendingJoinRequest = !!existingJoinRequest;


    const currentUserMember = team.members.find(
      m => m.userId._id.toString() === userId
    );

    const isOwner = currentUserMember && currentUserMember.role === "owner";
    const isCoOwner = currentUserMember && currentUserMember.role === "coowner";
    const canManageRequests = isOwner || isCoOwner;

    let joinRequests = [];
    if (canManageRequests) {
      joinRequests = await TeamJoinRequest.find({
        team: team._id,
        status: "pending"
      }).populate("sender", "name profilePicture");
    }

    const canSendJoinRequest = !currentUserMember && !userAlreadyInAnyTeam;


    return res.render("teams/team", {
      team,
      currentUserMember,
      currentUserId: userId,
      isOwner,
      hasPendingJoinRequest,
      canManageRequests,
      joinRequests,
      canSendJoinRequest
    });
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    const userId = req.session.user.id;
    const memberIndex = team.members.findIndex(m => m.userId.toString() === userId);

    if (memberIndex === -1) return res.status(403).render('error', { status: 403, message: "Niste član ovog tima!" });

    const leavingMember = team.members[memberIndex];

    if (leavingMember.role === "owner") {
      team.members.splice(memberIndex, 1);

      if (team.members.length > 0) {
        let newOwner = team.members.find(m => m.role === "coowner") || team.members[0];
        newOwner.role = "owner";
      } else {
        await Team.findByIdAndDelete(team._id);
        return res.redirect("/teams");
      }
    } else {
      team.members.splice(memberIndex, 1);
    }

    await team.save();
    return res.redirect("/teams");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.kickMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const team = await Team.findById(teamId);
    const requester = team.members.find(m => m.userId.toString() === req.session.user.id);
    if (!requester || requester.role !== "owner") return res.status(403).render('error', { status: 403, message: "Nemate ovlasti za ovu radnju!" });

    team.members = team.members.filter(m => m.userId.toString() !== memberId);
    await team.save();
    res.redirect(`/teams/${teamId}`);
  } catch (error) {
    res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
    try {
      const { teamId, memberId } = req.params;
      const { newRole } = req.body;
      const team = await Team.findById(teamId);
  
      const requester = team.members.find(m => m.userId.toString() === req.session.user.id);
      if (!requester || requester.role !== "owner") return res.status(403).render('error', { status: 403, message: "Nemate ovlasti za ovu radnju!" });
  
      const member = team.members.find(m => m.userId.toString() === memberId);
      if (member) {
          member.role = newRole;
          await team.save();
      }
      res.redirect(`/teams/${teamId}`);
    } catch (error) {
      res.status(500).render('error', { status: 500, message: error.message });
    }
  };

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    const requester = team.members.find(m => m.userId.toString() === req.session.user.id);
    
    if (!requester || requester.role !== "owner") {
        return res.status(403).render('error', { status: 403, message: "Nemate ovlasti za ovu radnju!" });
    }

    await Team.findByIdAndDelete(req.params.id);
    return res.redirect("/teams");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!team) return res.status(404).render('error', { status: 404, message: "Tim ne postoji!" });
    return res.redirect("/teams");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};