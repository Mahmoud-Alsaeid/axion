const loader           = require('./_common/fileLoader');
const Pine             = require('qantra-pineapple');

/** 
 * load any file that match the pattern of function file and require them 
 * @return an array of the required functions
*/

Pine.prototype.data = null;
Pine.prototype._customWithData =async function(vo) {
    if(this.customValidators[vo.customWithData]){
        try {
        let result =  (await this.customValidators[vo.customWithData](vo.propValue, this.data));
        if (typeof variable == "boolean") {
            return result;
        } else {
            /** it will return true and will overright the value */
            this.formatted[vo.path]=result;
            return true;
        }
        } catch(err){
        console.error(`Error: custom validator ( ${vo.customWithData} )  has triggered error: ${err.toString()}`);
        return false;
        }
    } else {
        throw Error(`custom validator ${vo.customWithData} not found`);
        return false;
    }
}
module.exports = class ValidatorsLoader {
    constructor({models, customValidators}={}){
        this.models = models;
        this.customValidators = customValidators;
    }
    load(){

        const validators = {};

        /**
         * load schemes
         * load models ( passed to the consturctor )
         * load custom validators
         */
        const schemes = loader('./managers/**/*.schema.js');
        Object.keys(schemes).forEach(sk=>{
            
            let pine = new Pine({models: this.models, customValidators: this.customValidators});
            validators[sk] = {};
            Object.keys(schemes[sk]).forEach(s=>{
                validators[sk][s] =  async (data)=>{
                    pine.data = data;
                    return (await pine.validate(data, schemes[sk][s]));
                }
                /** also exports the trimmer function for the same */
                validators[sk][`${s}Trimmer`] = async (data)=>{
                    return (await pine.trim(data, schemes[sk][s]));
                }
            });
        })

        return validators;
    }
}