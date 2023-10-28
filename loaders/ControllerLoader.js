const fileLoader = require("./_common/fileLoader");

module.exports = class ControllerLoader {
    constructor(injectable) {
        this.injectable = injectable;
        this.moduleKey = injectable.config.dotEnv.MODULE_NAME;
    }

    load() {
        const apiHandlers = fileLoader('./managers/**/*.manager.api.js');
        Object.keys(apiHandlers).forEach(handlerKey=>{
            const handler = new apiHandlers[handlerKey](this.injectable);
            if (this.moduleKey in handler)
                this.injectable.managers[handler[this.moduleKey]] = handler
        });
    }

}