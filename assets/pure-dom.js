// Find raw funtion
function f(target, parent) {
    return parent.querySelector(target);
}

// Find All raw function
function fa(target, parent) {
    return parent.querySelectorAll(target);
}

// document find
function df(target) {
    return f(target, document);
}

// document find all
function dfAll(target) {
    return fa(target, document);
}

// Find helper
function fH(target, parent, all) {
    if (parent === undefined) {
        return all ? dfAll(target) : df(target);
    } else if (typeof parent === 'string') {
        const _parent = df(parent);
        if (_parent) {
            return all ? fa(target, _parent) : f(target, _parent);
        }
        return null;
    } else if (typeof parent === 'object') {
        if (parent.length !== undefined && parent.length > 0) {
            return all ? fa(target, parent[0]) : f(target, parent[0]);
        }
        return all ? fa(target, parent) : f(target, parent);
    }
    return null;
}

// Find function
function find(target, parent) {
    return fH(target, parent);
}

// Find All function
function findAll(target, parent) {
    return fH(target, parent, true);
}

// Set Attribute
function attr(element, name, value) {
    if (value !== undefined) {
        element.setAttribute(name, value);
    }
    return element.getAttribute(name);
}

// Remove Attribute
function removeAttr(element, name) {
    return element.removeAttribute(name);
}
