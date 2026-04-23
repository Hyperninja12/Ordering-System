import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Room from "../models/Room.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [bookingCounts, roomCounts, totalPaidAgg, recentBookings] = await Promise.all([
      Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Room.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.find()
        .populate("guest", "name")
        .populate("room", "code type")
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const bookingMap = bookingCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const roomMap = roomCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const summary = {
      totalBookings:
        (bookingMap.pending || 0) +
        (bookingMap.confirmed || 0) +
        (bookingMap.checked_in || 0) +
        (bookingMap.checked_out || 0) +
        (bookingMap.cancelled || 0),
      activeBookings:
        (bookingMap.pending || 0) + (bookingMap.confirmed || 0) + (bookingMap.checked_in || 0),
      pendingPayments: bookingMap.pending || 0,
      availableRooms: roomMap.available || 0,
      occupiedRooms: roomMap.occupied || 0,
      totalRevenue: Number((totalPaidAgg[0]?.total || 0).toFixed(2)),
      bookingsByStatus: bookingMap,
      roomsByStatus: roomMap,
      recentBookings,
    };

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
