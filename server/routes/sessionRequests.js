
import express from "express";
import mongoose from "mongoose";
import SessionRequest from "../models/SessionRequest.js";
import { verifyToken } from "../middlewares/auth.js";
import { getIo, getOnlineUsers } from "../socket.js";

const router = express.Router();


router.post("/", verifyToken, async (req, res) => {
  try {
    const childId =
      req.user.role === "child" ? req.user._id : req.user.children?.[0] || null;
    if (!childId) {
      return res.status(400).json({ error: "No child linked to account." });
    }

 
    const existing = await SessionRequest.findOne({
      child: childId,
      status: { $in: ["pending", "in_progress"] },
    });
    if (existing) {
      return res.status(400).json({ error: "Active session exists." });
    }

    // Create and save new request
    const reqObj = new SessionRequest({
      child: childId,
      description: req.body.description || "No description",
      requestedAt: new Date(),
    });
    await reqObj.save();
    const populatedRequest = await SessionRequest.findById(reqObj._id).populate(
      "child",
      "profile.name profile.disabilityType profile.additionalInfo"
    );
    
    const emitChildData = populatedRequest
      ? populatedRequest.child
      : reqObj.child;
    

    // EMIT to all therapists in "therapist" room 
    const io = getIo();
    const therapists = getOnlineUsers().filter(user => user.role === 'therapist');
    therapists.forEach(therapist => {
      io.to(therapist.socketId).emit('new_session_request', {
        requestId: reqObj._id,
        child: emitChildData, 
        requestedAt: reqObj.requestedAt,
        status: reqObj.status,
        description: reqObj.description
      });
    });

    return res.json(populatedRequest || reqObj);
  } catch (err) {
    console.error("Error creating session request:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// Get My Request (child/parent)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const childId =
      req.user.role === "child" ? req.user._id : req.user.children?.[0] || null;
    if (!childId) return res.json(null);

    const request = await SessionRequest.findOne({ child: childId })
      .sort({ requestedAt: -1 })
      .populate("child", "profile.name");
    return res.json(request);
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

// Therapist Accept Request
router.put("/:id/accept", verifyToken, async (req, res) => {
  if (req.user.role !== "therapist") return res.status(403).end();
  try {
    const session = await SessionRequest.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        status: "pending",
      },
      {
        status: "in_progress",
        therapist: req.user._id,
        acceptedAt: new Date(),
      },
      { new: true }
    ).populate("child", "profile.name");

    if (!session) return res.status(400).json({ error: "Invalid request." });

    // EMIT to the specific child’s userId room
    const io = getIo();
    const payload = {
      requestId: session._id,
      status: session.status,
      acceptedAt: session.acceptedAt,
      therapist: session.therapist,
    };
    io.to(session.child._id.toString()).emit(
      "session_request_updated",
      payload
    );

    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

// Therapist Decline Request
router.put("/:id/decline", verifyToken, async (req, res) => {
  if (req.user.role !== "therapist") return res.status(403).end();
  try {
    const session = await SessionRequest.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        status: "pending",
      },
      { status: "declined" },
      { new: true }
    );
    if (!session) return res.status(400).json({ error: "Invalid request." });

    // EMIT to the child’s room that it was declined 
    const io = getIo();
    io.to(session.child.toString()).emit("session_request_updated", {
      requestId: session._id,
      status: session.status, 
      declinedAt: session.declinedAt,
    });

    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

// Therapist End Session
router.put("/:id/end", verifyToken, async (req, res) => {
  if (req.user.role !== "therapist") return res.status(403).end();
  try {
    const session = await SessionRequest.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        status: "in_progress",
      },
      {
        status: "completed",
        endedAt: new Date(),
      },
      { new: true }
    ).populate("child", "profile.name");

    if (!session) return res.status(400).json({ error: "Invalid request." });

    // EMIT to both patient and therapist if needed 
    const io = getIo();
    const payload = {
      requestId: session._id,
      status: session.status,
      endedAt: session.endedAt,
    };

    // Notify the child:
    io.to(session.child._id.toString()).emit(
      "session_request_updated",
      payload
    );

    
    io.to(req.user._id.toString()).emit("session_request_updated", payload);

    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

// Get All Requests (Therapist)
router.get("/", verifyToken, async (req, res) => {
  if (req.user.role !== "therapist") return res.status(403).end();
  try {
    const requests = await SessionRequest.find({
      status: { $in: ["pending", "in_progress"] },
    }).populate("child", "profile.name profile.disabilityType profile.additionalInfo");
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

router.delete("/:requestId", verifyToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const childId = req.user.role === "child" ? req.user._id : req.user.children?.[0] || null;
    
    if (!childId) {
      return res.status(400).json({ error: "No child linked to account." });
    }

    // Find and delete the request 
    const deletedRequest = await SessionRequest.findOneAndDelete({
      _id: requestId,
      child: childId,
      status: { $in: ["pending", "in_progress"] }
    });

    if (!deletedRequest) {
      return res.status(404).json({ error: "Request not found or cannot be deleted." });
    }

    
    const io = getIo();
    const therapists = getOnlineUsers().filter(user => user.role === 'therapist');
    therapists.forEach(therapist => {
      io.to(therapist.socketId).emit('session_request_deleted', {
        requestId: deletedRequest._id
      });
    });

    return res.json({ message: "Session request deleted successfully." });
  } catch (err) {
    console.error("Error deleting session request:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
