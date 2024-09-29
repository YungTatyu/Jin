const fs = require('fs');
const path = require('path');

function findPackagesUsingBigint(directory) {
  const packageJsonPath = path.join(directory, 'package.json');
  const nodeModulesPath = path.join(directory, 'node_modules');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const [name, version] of Object.entries(allDependencies)) {
      const depPackageJsonPath = path.join(
        nodeModulesPath,
        name,
        'package.json'
      );
      if (fs.existsSync(depPackageJsonPath)) {
        const depPackageJson = JSON.parse(
          fs.readFileSync(depPackageJsonPath, 'utf8')
        );
        if (depPackageJson.dependencies && depPackageJson.dependencies.bigint) {
          console.log(`Package ${name} uses bigint`);
        }
      }
    }
  }

  if (fs.existsSync(nodeModulesPath)) {
    fs.readdirSync(nodeModulesPath).forEach((file) => {
      const fullPath = path.join(nodeModulesPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findPackagesUsingBigint(fullPath);
      }
    });
  }
}

console.log('Checking for packages using bigint...');
findPackagesUsingBigint(process.cwd());
console.log('Finished checking.');
