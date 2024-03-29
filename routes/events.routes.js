// Imports
const router = require("express").Router();
const {Types: {ObjectId}} = require('mongoose');

// Import Models
const Events = require("../models/event.model");
const Posts = require("../models/post.model");

// Import Middleware
const isLoggedIn = require("../middleware/isLoggedIn");

// Functions
const isValidObjectId = (id) => ObjectId.isValid(id) && (new ObjectId(id)).toString() === id;

// Create an Event
router.post("/", isLoggedIn, (req, res) => {
    // Destructuring constants
    const {location, eventDescription, eventName} = req.body;
    const user = req.user._id;

    // Field validation
    if (typeof location != 'object') return res.status(400).json({errorMessage: "Please provide a valid location."});
    if (typeof location.address != "string") return res.status(400).json({errorMessage: "Please provide a valid address."});
    if (typeof location.city != "string") return res.status(400).json({errorMessage: "Please provide a valid city."});
    if (typeof location.state != "string") return res.status(400).json({errorMessage: "Please provide a valid state."});
    if (typeof location.zipCode != 'number') return res.status(400).json({errorMessage: "Please provide a valid Zip Code"});
    if (typeof eventName != "string") return res.status(400).json({errorMessage: "Please provide a valid event name."});
    if (typeof eventDescription != "string") return res.status(400).json({errorMessage: "Please provide a event description."});

    // Create an event object
    const newEvent = {user, eventName, eventDescription, location};

    // Create event
    Events.create(newEvent)
        .then((event) => {
            return res.json(event);
        })
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });
});

// Read all Events
router.get("/", (req, res) => {
    Events.find()
        .then((events) => {
            return res.json(events);
        })
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });
});

// Read a single event
router.get("/:eventId", async (req, res) => {
    // Validate the event ID
    if (!isValidObjectId(req.params.eventId)) return res.status(404).json({errorMessage: "Event ID is incorrect."});

    // Retrieve the event
    const eventInfo = await Events.findById(req.params.eventId)
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });

    // Returns error if an event doesn't exist
    if (!eventInfo) return res.status(404).json({errorMessage: "Event doesn't exist"});

    // Retrieves all posts from that event
    const postInfo = await Posts.find({externalId: req.params.eventId})
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });

    return res.json({eventInfo, postInfo});
});

// Update an event
router.patch("/:eventId", isLoggedIn, async (req, res) => {
    // Validate the event ID
    if (!isValidObjectId(req.params.eventId)) return res.status(404).json({errorMessage: "Event ID is incorrect."});

    // Retrieve event
    const eventInfo = await Events.findById(req.params.eventId).populate({path: "user", model: 'User'})
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });

    // Validate that the event exists and the user is the owner.
    if (!eventInfo) return res.status(404).json({errorMessage: "Event doesn't exist"});
    if (eventInfo['user'].username !== req.user.username) return res.status(401).json({errorMessage: "Not Authorized."});

    // Destructure the request
    const {location, eventDescription, eventName} = req.body;

    // Field validation
    if (typeof location != 'object') return res.status(400).json({errorMessage: "Please provide a valid location."});
    if (typeof location.address != "string") return res.status(400).json({errorMessage: "Please provide a valid address."});
    if (typeof location.city != "string") return res.status(400).json({errorMessage: "Please provide a valid city."});
    if (typeof location.state != "string") return res.status(400).json({errorMessage: "Please provide a valid state."});
    if (typeof location.zipCode != 'number') return res.status(400).json({errorMessage: "Please provide a valid Zip Code"});
    if (typeof eventName != "string") return res.status(400).json({errorMessage: "Please provide a valid event name."});
    if (typeof eventDescription != "string") return res.status(400).json({errorMessage: "Please provide a event description."});

    // Create event object
    const updateEvent = {eventDescription, location, eventName};

    // Edit the event
    Events.findByIdAndUpdate(req.params.eventId, updateEvent, {new: true})
        .then((event) => {
            return res.json(event);
        })
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });
});

// Delete an event
router.delete("/:eventId", isLoggedIn, async (req, res) => {
    // Validate the event ID
    if (!isValidObjectId(req.params.eventId)) return res.status(404).json({errorMessage: "Event ID is incorrect."});

    // Retrieve event
    const event = await Events.findById(req.params.eventId).populate({path: "user", model: 'User'})
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });

    // Validate that the event exists and the user is the owner.
    if (!event) return res.status(404).json({errorMessage: "Event doesn't exist"});
    if (event['user'].username !== req.user.username) return res.status(401).json({errorMessage: "Not Authorized."});

    // Delete Event
    Events.findByIdAndDelete(req.params.eventId)
        .then((event) => {
            return res.json(event);
        })
        .catch((err) => {
            return res.status(400).json({errorMessage: err.message});
        });
});

module.exports = router;
