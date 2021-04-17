import jwt from 'jsonwebtoken';

export default class Token {

    private static seed: string = 'seed-home-inventory';
    private static caducity: string = '30d';

    constructor(){}

    static getJwtToken( payload:any ){
        return jwt.sign({
            user: payload
        }, this.seed, { expiresIn: this.caducity});
    }

    static checkToken(userToken: string){
        return new Promise((res, rej) => {
            jwt.verify( userToken, this.seed, (err, decoded) => {
                if (err) {
                    rej();
                }else{
                    res(decoded);
                }
            })
        });
    }
}