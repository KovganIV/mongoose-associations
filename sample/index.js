var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/local');

var mongooseAssociations = require('./../')(mongoose)
  , schemaPlugin = mongooseAssociations.plugin;

mongoose.plugin(schemaPlugin);

var Game = new mongoose.Schema({
  title: String
});

var Player = new mongoose.Schema({
  name: String
});

var GameModel = mongoose.model('Game', Game);
var PlayerModel = mongoose.model('Player', Player);

mongooseAssociations.oneToMany(GameModel, 'Game', PlayerModel, 'Player');


var item = new GameModel({
  _id: '56f8f69b6bc82bbd13b403dc'
  //name: 'Test1',
  //PlayerIds: ['56f8f4d6cf08ec8113b84379', '56f8f4d888fe8883135fcee4', '56f8f4d80568918513f1d94a']
  //GameId: '56f8f69b6bc82bbd13b403dc'
  //Game: {_id: '56f433623844ea80146c22fa', title: 'Yra dura'}
});

item.remove();
//console.log(PlayerModel.schema.paths);

//item.save()
//  .catch(function(err) {
//    console.log(err);
//  });

//PlayerModel
//  .remove({_id: '56fb3c440f4bd0f632341752'})
//  .then(function(result) {
//    //console.log(result[0].get('Player'));
//    //console.log(result);
//    //console.log(Object.keys(result), result._posts);
//    //return item.save();
//  })
//  //.then(function(result) {
//  //  console.log(result);
//  //});
//  .catch(function(err) {
//    console.log(err);
//  });

//item.save(function(error, doc) {
//  console.log(error, doc);
//});