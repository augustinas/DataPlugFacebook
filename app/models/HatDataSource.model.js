const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HatDataSourceSchema = new Schema({
  hatHost:            { type: String, required: true },
  name:               { type: String, required: true },
  source:             { type: String, required: true },
  sourceAccessToken:  String,
  dataSourceModel:    Schema.Types.Mixed,
  dataSourceModelId:  Number,
  hatIdMapping:       Schema.Types.Mixed,
  lastUpdateTime:   String
});

module.exports = mongoose.model('HatDataSource', HatDataSourceSchema);