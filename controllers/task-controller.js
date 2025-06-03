import redisClient from "../config/redis.js";
import Task from "../models/task-model.js";

export const getTasks = async (req, res, next) => {
  try {
    const cached = await redisClient.get("tasks:public");

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const tasks = await Task.findAll({ where: { status: "open" } });

    await redisClient.setEx("tasks:public", 1800, JSON.stringify(tasks)); // TTL 30 min

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, category, deadline } = req.body;
    const newTask = await Task.create({
      title,
      description,
      category,
      status: "open",
      deadline,
      createdBy: req.user.id,
    });

    await redisClient.del("tasks:public");

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task || task.createdBy !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    Object.assign(task, req.body);
    await task.save();

    await redisClient.del("tasks:public");

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task || task.createdBy !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await task.destroy();

    await redisClient.del("tasks:public");

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
