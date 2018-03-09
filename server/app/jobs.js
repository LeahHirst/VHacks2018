function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371e3; // metres
  var φ1 = lat1 * (Math.PI / 180);
  var φ2 = lat2 * (Math.PI / 180);
  var Δφ = (lat2-lat1) * (Math.PI / 180);
  var Δλ = (lon2-lon1) * (Math.PI / 180);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

module.exports = (db) => {
  return {
    getJobsFromLocality: (latitude, longitude, searchRadius, cb) => {
      /*
      * Finds all jobs in a square around a given latlon and filters distances
      * that are too far.
      */

      var rDist = searchRadius / 111; // Search radius (in km)

      db.model.Job.find({
        'location.latitude': { $gte: latitude-rDist, $lt: latitude+rDist },
        'location.longitude': { $gt: longitude-rDist, $lt: latitude+rDist }
      }, (err, jobs) => {
        if (err) return cb(err);

        var x = jobs.length;
        for (var i = 0; i < x; i++) {
          // calc distance
          var l = jobs[i].location;
          var dist = calculateDistance(latitude, longitude, l.latitude, l.longitude);

          // Filter out
          if (dist > searchRadius) {
            array.splice(i, 1);
            i--; x--;
          }
        }

        cb(null, jobs);
      });
    }
  }
}
