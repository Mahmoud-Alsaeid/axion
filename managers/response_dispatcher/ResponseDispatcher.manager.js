const { flattenObject, setDeepValue } = require("../../libs/utils");

module.exports = class ResponseDispatcher {
    constructor(){
        this.key = "responseDispatcher";
    }
    cleanData(data) {

        const excludedKeys = ['password','__v'];
        const flattenedObject = flattenObject(data);

        Object.keys(flattenedObject).forEach(key=>{
            if ( excludedKeys.includes( key.split('.').at(-1))){
                setDeepValue({path:key, value: undefined, obj: data})
            }
        });
        return data;
    }
    dispatch(res, {ok, data, code, errors, message, msg}){
        let statusCode = code? code: (ok==true)?200:400;
        if(data)data = this.cleanData(data);
        return res.status(statusCode).send({
            ok: ok || false,
            data: data || {},
            errors: errors || [],
            message: msg || message ||'',
        });
    }
}