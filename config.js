exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://ds019708.mlab.com/grilledcheese'; 
exports.PORT = process.env.PORT || 19780;

//database name = grilledcheese
//collection name = blogposts