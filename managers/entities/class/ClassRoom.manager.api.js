const mongoose = require("mongoose");
const APIFeatures = require('../../../libs/apiFeatures');

const bcrypt = require("bcrypt");
const ClassModel = require("./classRoom.model");

module.exports = class ClassRoom {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.sf = managers.shark;
    this.httpExposed = [
      "createClassRoom",
      "get=getClassRoom",
      "get=getAllClassRoom",
      "put=updateClassRoom",
      "delete=deleteClassRoom",
    ];
    this[this.config.dotEnv.MODULE_NAME] = "classRoom";
    this.cache = cache;
  }



async createClassRoom({__shortToken : user,name, capacity, school,location}){
  if(!(await this.sf.isGranted({
    layer : 'classroom',
    variant : user.role,
    action: 'create'
  }))){
    return {error: `Forbidden`}
  }
  const classRoom = {name , capacity , school,location}
  const Exschool = await this.mongomodels.school.find({school})
  if(!Exschool){
        return {error: `Invalid school`}
    }
  const createdclassRoom = await this.mongomodels.classRoom.create(classRoom)
  return {createdclassRoom}
}


async getClassRoom({__query}){
  const {id} = __query
  const classRoom = await this.mongomodels.classRoom.findById(id)
  return {classRoom}
}
 

async getAllClassRoom({__query}){
  const key = 'get-classes::'+__query.toString()
  const fromCache = await this.cache.key.get({key });

  const classRoomQuery = new APIFeatures( this.mongomodels.classRoom.find(),__query).select().filter().page().sort()

  const classRoom = await classRoomQuery.lean()
    return {classRoom}
  }

  
  sanitizeBody(body) {
    const sanitizedBody = { ...body };
    delete sanitizedBody.__device;
    delete sanitizedBody.res;
    return sanitizedBody;
  }

  async updateClassRoom({__query,__shortToken : user,...body}){
    if(!(await this.sf.isGranted({
      layer : 'classroom',
      variant : user.role,
      action: 'update'
    }))){
      return {error: `Forbidden`}
    }    const {id} = __query
    const sanitizedBody = this.sanitizeBody(body);
    if(sanitizedBody.school){
        const school = await this.mongomodels.school.find({school : sanitizedBody.school})
        if(!school){
          return {error: `Invalid school`}
      }
    }
      const classRoom = await this.mongomodels.classRoom.findByIdAndUpdate(id,sanitizedBody,{ new: true })
      return {classRoom}
    }

async deleteClassRoom({ __query,__shortToken : user  }) {
  if(!(await this.sf.isGranted({
    layer : 'classroom',
    variant : user.role,
    action: 'delete'
  }))){
    return {error: `Forbidden`}
  } 
  const { id } = __query;
    const classRoom = await this.mongomodels.classRoom.findByIdAndDelete(id);
    return "Class room deleted";
  }
}