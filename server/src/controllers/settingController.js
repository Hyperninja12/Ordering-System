import Setting from "../models/Setting.js";

const defaultPayload = (userId) => ({
  key: "global",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  taxRate: 12,
  currency: "USD",
  cancellationHours: 24,
  notificationEmail: "",
  updatedBy: userId,
});

export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: "global" });

    if (!settings) {
      settings = await Setting.create(defaultPayload(req.user._id));
    }

    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      key: "global",
      updatedBy: req.user._id,
    };

    const settings = await Setting.findOneAndUpdate({ key: "global" }, payload, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
