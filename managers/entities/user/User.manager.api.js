const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel = require("./user.model");
module.exports = class User {
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
    this.usersCollection = "users";
    this.httpExposed = [
      "createUser",
      "get=getUser",
      "post=login",
      "put=updateUser",
      "put=updatePassword",
      "get=getAllUsers",
      "delete=deleteUser",
    ];
    this[this.config.dotEnv.MODULE_NAME] = "user";
    this.cache = cache;
    this.load();
  }
  
  async cacheEmail(email) {
    const key = "user:"+email;
    await this.cache.key.set({ key, data: 1 });
  }
  async load() {
    const emails = await this.mongomodels["user"].find({}, "email");
    const proms = [];
    emails.forEach((email) => {
      proms.push(this.cacheEmail(email));
    });
    await Promise.all(proms);
  }

  async createUser({ username, email, password, role }) {
    const key = "user:"+email;
    const isExistedInCache = await this.cache.key.exists({ key });
    if (isExistedInCache) {
      return { error: `Email should be unique` };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      username,
      email,
      password: hashedPassword,
      role,
    };
    try {
      const createdUser = (
        await this.mongomodels["user"].create(user)
      );
      console.log({ sd: createdUser });
      const longToken = this.tokenManager.genLongToken({
        userId: createdUser._id,
        userKey: createdUser.username,
      });
      await this.cacheEmail(email);

      return {
        user: createdUser,
        longToken,
      };
    } catch (err) {
      console.log({ err });
      if (err.code === 11000) {
        return {
          error: `${Object.keys(err.keyPattern).join(",")} should be unique`,
        };
      }
      throw err;
    } 
  }

  async login({ email, password }) {
    const user = await this.mongomodels.user.findOne({ email }, "+password");
    const longToken = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: user.username,
    });

    console.log(longToken);

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return {
        user,
        longToken,
      };
    }
    return { error: "Invalid credentials" };
  }

  async getAllUsers() {
    const user = await this.mongomodels.user.find();
    return { user };
  }

  async getUser({ __shortToken }) {
    return { user: __shortToken };
  }

  sanitizeBody(body) {
    const sanitizedBody = { ...body };
    delete sanitizedBody.__device;
    delete sanitizedBody.res;
    return sanitizedBody;
  }

  async updateUser({ __shortToken, ...body }) {
    const userId = __shortToken._id
    const sanitizedBody = this.sanitizeBody(body);

    if (sanitizedBody.password) {
      return {
        error: `This route is not for updating the password !, Use updatePassword route`,
      };
    }
    const email = __shortToken.email;
    await this.cache.key.delete({ key: email });
    if (sanitizedBody.email) {
      const key = "user:"+sanitizedBody.email;
      const isExistedInCache = await this.cache.key.exists({
        key
      });
      if (isExistedInCache) {
        return { error: `Email should be unique` };
      }
    }
    const newUser = await this.mongomodels.user.findByIdAndUpdate(
      userId,
      sanitizedBody,
      { new: true }
    );
    return { user: newUser };
  }

  async deleteUser({ __shortToken }) {
    const { userId } = __shortToken;
    const ret = await this.mongomodels.user.findByIdAndDelete(userId);
    return "user deleted";
  }

  async updatePassword({ __shortToken, ...body }) {
    const userId  = __shortToken._id;
    const sanitizedBody = this.sanitizeBody(body);
    const user = await this.mongomodels.user
      .findById(userId)
      .select("+password");
    const isPasswordValid = await bcrypt.compare(
      sanitizedBody.currentPassword,
      user.password
    );
    if (isPasswordValid) {
      const password = await bcrypt.hash(sanitizedBody.newPassword, 10);
      user.password = password;
      await user.save();
      return {
        user,
        // longToken,
      };
    }
    return { error: "Invalid current password" };
  }
};
