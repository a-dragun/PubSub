const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamController");

router.get('/', teamsController.getAllTeams);
router.get('/create', teamsController.getCreateTeam);
router.get('/:id', teamsController.getTeamById);

router.post('/', teamsController.createTeam);

router.delete('/:id/leave', teamsController.leaveTeam);
router.delete('/:teamId/kick/:memberId', teamsController.kickMember);
router.delete('/:id', teamsController.deleteTeam);

router.put('/:teamId/role/:memberId', teamsController.updateMemberRole);
router.put('/:id', teamsController.updateTeam);


module.exports = router;
