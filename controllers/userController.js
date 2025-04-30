const User = require("../models/User");

exports.deleteUser = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;
    if(user.id == id){
        await User.findByIdAndDelete(id);
        req.session.destroy(() => res.redirect("/"));
    }
    return res.json({message: "User deleted successfuly"});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getProfile = async (req, res) => {
    try {
        userId = req.session.user.id;
        user = await User.findById(userId);
        return res.render("user/profile", {user});

    } catch (error) {
        return res.send("Error: " + error.message);
    }
}

exports.editUser = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.params.id;
    const updates = req.body;

    if(user.id == id){
        await User.findByIdAndUpdate(id, updates, { new: true });
    }

    return res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};