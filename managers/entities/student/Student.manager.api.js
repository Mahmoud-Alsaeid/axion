const mongoose = require("mongoose");
const APIFeatures = require('../../../libs/apiFeatures');

const StudentModel = require("./student.model");

module.exports = class Student {
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
      "createStudent",
      "findStudentsByClassroom",
      "get=getAllStudents",
      "get=getStudent",
      "put=updateStudent",
      "delete=deleteStudent"
    ];
    this[this.config.dotEnv.MODULE_NAME] = "student";
    this.cache = cache;
    this.load();
  }
  async cacheEmail(email) {
    const key = 'student:'+email
    await this.cache.key.set({ key, data: 1 });
  }
  async load() {
    const emails = await this.mongomodels["student"].find({}, "email");
    const proms = [];
    emails.forEach((email) => {
      proms.push(this.cacheEmail(email));
    });
    await Promise.all(proms);
  }


async findStudentsByClassroom({__query}){
  const {classroom} = __query
  const ExsClassroom = await this.mongomodels.classRoom.find({classroom})
    if(!ExsClassroom){
          return {error: `Invalid classroom`}
      }
      const students = await this.mongomodels.student.find({classroom : classroom})
      return {students}
}

  async createStudent({ __shortToken : user,...body}){
    if(!(await this.sf.isGranted({
      layer : 'student',
      variant : user.role,
      action: 'create'
    }))){
      return {error: `Forbidden`}
    }
    const sanitizedBody = this.sanitizeBody(body);
    const key = 'student'+sanitizedBody.email
    const classroom = sanitizedBody.classroom
    const ExsClassroom = await this.mongomodels.classRoom.findById(classroom)
    if(!ExsClassroom){
          return {error: `Invalid classroom`}
      }
      const isExistedInCache = await this.cache.key.exists({ key });
      if (isExistedInCache) {
        return { error: `Email should be unique` };
      }
      await this.cacheEmail(sanitizedBody.email);
    const createdStudent = await this.mongomodels.student.create(sanitizedBody)
    return {createdStudent}
  }
  
  
  async getStudent({__query}){
    const {id} = __query
    console.log(this.mongomodels)
    const student = await this.mongomodels.student.findById(id).populate('classroom')
    return {student}
  }
   
  
  async getAllStudents({__query}){
    const studentQuery = new APIFeatures( this.mongomodels.student.find(),__query).select().filter().page().sort()
    const student = await studentQuery.lean()
      return {student}
    }
  
    
    sanitizeBody(body) {
      const sanitizedBody = { ...body };
      delete sanitizedBody.__device;
      delete sanitizedBody.res;
      return sanitizedBody;
    }
  
    async updateStudent({__query,__shortToken : user,...body}){
      if(!(await this.sf.isGranted({
        layer : 'student',
        variant : user.role,
        action: 'update'
      }))){
        return {error: `Forbidden`}
      }
      const {id} = __query
      const sanitizedBody = this.sanitizeBody(body);
      const classroom = sanitizedBody.classroom
      if(classroom){
          const ExClassroom = await this.mongomodels.classRoom.findById(classroom)
          if(!ExClassroom){
            return {error: `Invalid classroom`}
        }
      }
    const oldStudent = await this.mongomodels.student.findById(id);
    const email = oldStudent.email;
    await this.cache.key.delete({ key: email });
    if (sanitizedBody.email) {
      const key = 'student'+sanitizedBody.email
      const isExistedInCache = await this.cache.key.exists({
        key
      });
      if (isExistedInCache) {
        return { error: `Email should be unique` };
      }
    }
    
    await this.cacheEmail(email);
        const student = await this.mongomodels.student.findByIdAndUpdate(id,sanitizedBody,{ new: true })
        return {student}
      }
  
  async deleteStudent({ __query,__shortToken : user }) {
    if(!(await this.sf.isGranted({
      layer : 'student',
      variant : user.role,
      action: 'delete'
    }))){
      return {error: `Forbidden`}
    }
      const { id } = __query;
      const student = await this.mongomodels.student.findByIdAndDelete(id);
      return "Student deleted";
    }
}