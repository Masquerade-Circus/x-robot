import { sidebar } from "vuepress-theme-hope";

/*

This file exports a function that returns a vuepress sidebar config.

It will search for all directories and md files in the docs/src/ directory 
recursively and create a sidebar config from them.

If the directory has a Readme.md file, it will use that file to get the title for the sidebar,
otherwise it will use the directory name. And the grouping will be a link-group type. 

If the directory has not a Readme.md file, it will use the directory name as the title and
the grouping will be a group type.

For each file in the directory, it will create a link type sidebar item and will use the file to 
get the title.

The title will be the first h1 tag in the file or the file name if no h1 tag is found.
*/

const fs = require("fs");
const path = require("path");

function getTitle(filePath) {
  let stats = fs.statSync(filePath);

  if (stats.isFile()) {
    let content = fs.readFileSync(filePath, "utf8");
    let title = content.match(/\ntitle: (.*)\s?\n/);

    if (!title) {
      title = content.match(/# (.*)/);
    }

    if (!title) {
      title = content.match(/<h1>(.*)<\/h1>/);
    }

    if (title) {
      return title[1];
    }
  }

  if (
    stats.isDirectory() &&
    fs.existsSync(path.join(filePath, ".config.yml"))
  ) {
    let config = fs.readFileSync(path.join(filePath, ".config.yml"), "utf8");
    let title = config.match(/\ntitle: (.*)\s?\n/);

    if (title) {
      return title[1];
    }
  }

  let title = filePath.split("/").pop();

  // Convert to title case and remove the .md extension
  return title
    .replace(/\.md$/, "")
    .replace(/\W/g, " ")
    .replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getIcon(filePath) {
  let stats = fs.statSync(filePath);

  if (stats.isFile() && filePath.endsWith(".md")) {
    let content = fs.readFileSync(filePath, "utf8");
    let icon = content.match(/\nicon: (.*)\s?\n/);

    if (icon) {
      return icon[1];
    }
  }

  if (
    stats.isDirectory() &&
    fs.existsSync(path.join(filePath, ".config.yml"))
  ) {
    let config = fs.readFileSync(path.join(filePath, ".config.yml"), "utf8");
    let icon = config.match(/\nicon: (.*)\s?\n/);

    if (icon) {
      return icon[1];
    }
  }

  return "";
}

function getFileItem(filePath, dirPath) {
  let title = getTitle(filePath);
  let icon = getIcon(filePath);
  let fileName = filePath.replace(dirPath, "");

  let item: any = {
    text: title,
    link: fileName,
    icon: icon
  };

  return item;
}

function getChildrenWithReplacedTitles(children, replace) {
  let newChildren: any[] = [];
  for (let child of children) {
    let newChild = { ...child };
    if (child.text) {
      newChild.text = child.text.replace(replace, "").trim();
    }

    if (child.children) {
      newChild.children = getChildrenWithReplacedTitles(
        child.children,
        replace
      );
    }

    newChildren.push(newChild);
  }
  return newChildren;
}

function reorderApi(sidebarItem) {
  let newChildren: any[] = [];
  let apiChild = sidebarItem.shift();
  let modulesChild = apiChild.children.find(
    (child) => child.text === "Modules"
  );
  let clasesChild = apiChild.children.find((child) => child.text === "Classes");
  let enumsChild = apiChild.children.find((child) => child.text === "Enums");
  let interfacesChild = apiChild.children.find(
    (child) => child.text === "Interfaces"
  );

  if (modulesChild) {
    newChildren.push({
      ...modulesChild,
      children: getChildrenWithReplacedTitles(modulesChild.children, "Module:")
    });
  }

  if (clasesChild) {
    newChildren.push({
      ...clasesChild,
      children: getChildrenWithReplacedTitles(clasesChild.children, "Class:")
    });
  }

  if (interfacesChild) {
    newChildren.push({
      ...interfacesChild,
      children: getChildrenWithReplacedTitles(
        interfacesChild.children,
        "Interface:"
      )
    });
  }

  if (enumsChild) {
    newChildren.push({
      ...enumsChild,
      children: getChildrenWithReplacedTitles(
        enumsChild.children,
        "Enumeration:"
      )
    });
  }

  return [
    {
      ...apiChild,
      icon: "api",
      children: newChildren
    }
  ];
}

function getSidebarItem(dir, dirPath) {
  let files = fs.readdirSync(dir);
  let children: any[] = [];
  let title = getTitle(path.resolve(dirPath, dir));
  let icon = getIcon(path.resolve(dirPath, dir));
  let hasReadme = files.includes("README.md");

  for (let file of files) {
    if (file.startsWith(".")) {
      continue;
    }

    if (file === "index.md" || file === "README.md") {
      title = getTitle(path.resolve(dir, file));
      icon = getIcon(path.resolve(dir, file));
      continue;
    }

    if (file.endsWith(".md")) {
      children.push(getFileItem(path.resolve(dir, file), dirPath));
      continue;
    }

    let stats = fs.statSync(path.resolve(dir, file));
    if (stats.isDirectory()) {
      let sidebarItem = getSidebarItem(path.resolve(dir, file), dirPath);
      if (sidebarItem) {
        children.push(sidebarItem);
      }
    }
  }

  if (children.length > 0) {
    let item: any = {
      text: title,
      icon: icon,
      collapsable: true,
      children
    };

    if (hasReadme) {
      item.link = `${dir.replace(dirPath, "")}/`;
    }

    return item;
  }
}

function getSidebar({ apiDir }) {
  const sidebar = {};
  let dirPath = path.resolve(__dirname, "../");
  let dirs = fs.readdirSync(dirPath);

  for (let dir of dirs) {
    if (dir.startsWith(".") || dir.endsWith(".md")) {
      continue;
    }

    let stats = fs.statSync(path.resolve(dirPath, dir));
    if (stats.isDirectory()) {
      let sidebarItem = getSidebarItem(path.resolve(dirPath, dir), dirPath);
      if (sidebarItem) {
        console.log(sidebarItem);
        sidebar[`/${dir}/`] = [sidebarItem];

        if (dir === apiDir) {
          sidebar[`/${dir}/`] = reorderApi(sidebar[`/${dir}/`]);
        }
      }
    }
  }

  return sidebar;
}

export default sidebar(getSidebar({ apiDir: "api" }));
