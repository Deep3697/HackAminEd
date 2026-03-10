process.on('uncaughtException', (e) => {
    console.log("UNCAUGHT EXCEPTION:", e.message);
    console.log(e.stack);
});
process.on('unhandledRejection', (e) => {
    console.log("UNHANDLED REJECTION:", e.message);
    console.log(e.stack);
});

try {
    require('./index.js');
} catch (e) {
    console.log("CRASH MESSAGE:", e.message);
    console.log("CRASH STACK:", e.stack);
}
