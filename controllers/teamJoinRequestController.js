const Team = require("../models/Team");
const TeamJoinRequest = require("../models/TeamJoinRequest");

exports.sendJoinRequest = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { teamId } = req.params;

    const alreadyInTeam = await Team.findOne({
      "members.userId": userId
    });

    if (alreadyInTeam) {
      return res.redirect(`/teams/${teamId}`);
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).render('error', { status: 404, message: "Tim ne postoji!" });

    const alreadyMember = team.members.some(
      m => m.userId.toString() === userId
    );
    if (alreadyMember) return res.redirect(`/teams/${teamId}`);

    const existingRequest = await TeamJoinRequest.findOne({
      team: teamId,
      sender: userId,
      status: "pending"
    });

    if (existingRequest) return res.redirect(`/teams/${teamId}`);

    await TeamJoinRequest.create({
      team: teamId,
      sender: userId
    });

    return res.redirect(`/teams/${teamId}`);
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.acceptJoinRequest = async (req, res) => {
  try {
    const request = await TeamJoinRequest.findById(req.params.id)
      .populate("team")
      .populate("sender");

    if (!request) return res.status(404).render('error', { status: 404, message: "Zahtjev ne postoji!" });
    const alreadyInTeam = await Team.findOne({
      "members.userId": request.sender._id
    });

    if (alreadyInTeam) {
      await TeamJoinRequest.deleteMany({ sender: request.sender._id });
      return res.redirect(`/teams/${request.team._id}`);
    }

    request.team.members.push({
      userId: request.sender._id,
      role: "member"
    });

    await request.team.save();
    
    await TeamJoinRequest.deleteMany({
      sender: request.sender._id
    });

    return res.redirect(`/teams/${request.team._id}`);
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    await TeamJoinRequest.findByIdAndUpdate(req.params.id, {
      status: "rejected"
    });

    return res.redirect("back");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};
