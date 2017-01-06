exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/grilledcheese'; 
exports.PORT = process.env.PORT || 8080;

//database name = grilledcheese
//collection name = blogposts

// ds019708.mlab.com
// port? 19780