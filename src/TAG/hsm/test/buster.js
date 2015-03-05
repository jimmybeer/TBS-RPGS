//https://github.com/Mask/hsm-js/tree/master/test
var config = module.exports;

config["Tests"] = {
		rootPath: "../",
		tests: ["test/test*.js"]
};

config["Browser tests"] = {
		extends: "Tests",
		environment: "browser",
		sources: ["HSM.js"]
};

config["Node tests"] = {
		extends: "Tests",
		environment: "node"
};