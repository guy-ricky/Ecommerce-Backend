const mongoose = require('mongoose')
const validateMongoId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error ('This ID is not valid or not Found')
};

module.exports = validateMongoId