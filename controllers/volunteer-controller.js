import Volunteer from "../models/volunteer-model.js";

export const registerVolunteer = async (req, res, next) => {
  try {
    const { taskId, comment } = req.body;

    const exists = await Volunteer.findOne({
      taskId,
      userId: req.user.id,
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Ya estás inscrito a esta tarea" });
    }

    const newVolunteer = await Volunteer.create({
      taskId,
      userId: req.user.id,
      comment,
    });

    res.status(201).json(newVolunteer);
  } catch (err) {
    next(err);
  }
};

export const getVolunteersByTask = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find({
      taskId: req.params.taskId,
    }).populate("userId", "username email");
    res.json(volunteers);
  } catch (err) {
    next(err);
  }
};
