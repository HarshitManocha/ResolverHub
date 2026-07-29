import mongoose from "mongoose";
const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Companies",
    required: true
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  status:{
    type:String,
    enum:['Open', 'InProgress', 'Resolved', 'Closed'],
    default:'Open'
  },

  priority:{
    type:String,
    enum:['Low', 'Medium', 'High', 'Critical'],
    default:'Medium'
  }
},{timestamps:true});

const Bugs = mongoose.model('Bugs', bugSchema);
export default Bugs;