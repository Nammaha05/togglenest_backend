export const validateActivityLog = (req, res, next) => {
  const { action, entityType, entityId } = req.body;

  if (!action || !entityType || !entityId) {
    res.status(400);
    throw new Error("All fields are required");
  }

  next();
};