const mongoose = require("mongoose");
const APIFeatures = require('../../../libs/apiFeatures');

const bcrypt = require("bcrypt");
const SchoolModel = require("./school.model");

module.exports = class School {
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
      "createSchool",
      "get=getAllSchools",
      "get=getSchool",
      "put=updateSchool",
      "delete=deleteSchool"
    ];
    this[this.config.dotEnv.MODULE_NAME] = "school";
    this.cache = cache;
    this.load();
  }

  
  async cacheEmail(email) {
    const key = 'school'+email
    await this.cache.key.set({ key, data: 1 });
  }
  async load() {
    const emails = await this.mongomodels["school"].find({}, "email");
    const proms = [];
    emails.forEach((email) => {
      proms.push(this.cacheEmail(email));
    });
    await Promise.all(proms);
  }

 
  sanitizeBody(body) {
    const sanitizedBody = { ...body };
    delete sanitizedBody.__device;
    delete sanitizedBody.res;
    return sanitizedBody;
  }

  async createSchool({ __shortToken : user,...body}){
    if(!(await this.sf.isGranted({
      layer : 'school',
      variant : user.role,
      action: 'create'
    }))){
      return {error: `Forbidden`}
    }
    
    const sanitizedBody = this.sanitizeBody(body);
      if(sanitizedBody.schoolAdmins){
        sanitizedBody.schoolAdmins.map(async e => {
          const user = await this.mongomodels.user.findById(e)
          if(!user){
            return {error: `Invalid school admin`}
        }
        })
      }
      const key = 'school'+sanitizedBody.email 
    const isExistedInCache = await this.cache.key.exists({ key});
    if (isExistedInCache) {
      return { error: `Email should be unique` };
    }
   await this.cacheEmail(sanitizedBody.email);
    const createdSchool = await this.mongomodels.school.create(sanitizedBody)
    return {createdSchool}
  }

  async getAllSchools({__query}){
  const schoolsQuery = new APIFeatures( this.mongomodels.school.find(),__query).select().filter().page().sort()
  console.log(this.mongomodels);
  const schools = await schoolsQuery.lean()
   // const schools = await this.mongomodels.school.find()
    return {schools}
  }


  async getSchool({__query}){
    console.log(__query)
    const {id} = __query
      const school = await this.mongomodels.school.findById(id).populate('schoolAdmins')
      return {school}
    }
   

    
  async getSchool({__query,body}){
    const {id} = __query
      const school = await this.mongomodels.school.findById(id).populate('schoolAdmins')
      return {school}
    }


    async updateSchool({__query,__shortToken : user,...body}){
      if(!(await this.sf.isGranted({
        layer : 'school',
        variant : user.role,
        action: 'update'
      }))){
        return {error: `Forbidden`}
      }
      const {id} = __query
      const sanitizedBody = this.sanitizeBody(body);
      if(sanitizedBody.schoolAdmins){
        sanitizedBody.schoolAdmins.map(async e => {
          const user = await this.mongomodels.user.findById(e)
          if(!user){
            return {error: `Invalid school admin`}
        }
        })
      }
      
    const oldSchoool = await this.mongomodels.school.findById(id);
    const email = oldSchoool.email;
    await this.cache.key.delete({ key: email });
    if (sanitizedBody.email) {
      const key = 'school'+sanitizedBody.email 
      const isExistedInCache = await this.cache.key.exists({
        key
      });
      if (isExistedInCache) {
        return { error: `Email should be unique` };
      }
    }
    await this.cacheEmail(email);
        const school = await this.mongomodels.school.findByIdAndUpdate(id,sanitizedBody,{ new: true })
        return {school}
      }
 
   
  async deleteSchool({ __query,__shortToken : user }) {
    if(!(await this.sf.isGranted({
      layer : 'school',
      variant : user.role,
      action: 'delete'
    }))){
      return {error: `Forbidden`}
    }
    const { id } = __query;
    const school = await this.mongomodels.school.findByIdAndDelete(id);
    return "School deleted";
  }
}