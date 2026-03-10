const fs = require('fs');
try {
    require('./src/jobs/reminderJob.js');
    fs.writeFileSync('test_out.txt', 'SUCCESS');
} catch (e) {
    fs.writeFileSync('test_err.txt', e.stack);
}
