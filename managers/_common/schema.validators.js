module.exports = {
    'username': (data)=>{
        if(data.trim().length < 3){
            return false;
        }
        return true;
    },
    'confirmPassword': (data, obj) => new Promise((res, rej) => {
        if (data === obj.password) return res(true);
        rej(false);
    }),
    unique: async (data, n) => {
        console.log({data ,n});
    }
    
}