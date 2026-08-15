import packageJson from "../package.json";

/**
 * This file is used to export the package.json content as a module,
 * so that it can be imported in other files without using dynamic
 * imports or reading the file at runtime. This is useful for accessing
 * the package metadata (like name, version, description) in a type-safe way.
 */

export const pkg = Object.freeze(packageJson);
