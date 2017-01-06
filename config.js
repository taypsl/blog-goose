exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'user1:user1password@ds019708.mlab.com:19708/grilledcheese';
exports.PORT = process.env.PORT || 8080;