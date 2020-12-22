function HTMLElement(type) {
    this.type = type;
    this.attributes = {};
    this.children = [];
    this.innerHTML = '';
    this.innerText = '';
}
HTMLElement.prototype.setAttribute = function(key, value) {
    this.attributes[key] = value;
};
HTMLElement.prototype.appendChild = function(childElement) {
    this.children.push(childElement);
};
function Text(str) {
    this.type = 'text';
    this.innerText = str;
}
Text.prototype = new HTMLElement();

const document = {
    createElement: type => new HTMLElement(type),
    getElementById: id => new HTMLElement('div'),
};

// ---

const React = {
    Component: function(props) {
        this.props = props || {};
    },
    createElement: function(type, props/*, ...children */) {
        var children = [].slice.call(arguments, 2);
        if (type.bind) {
            const elemProps = Object.assign({ children }, props);
            if (type.prototype instanceof React.Component) {
                return new type(elemProps);
            }
            return type(elemProps);
        }
        const htmlElement = document.createElement(type);
        for (var attr in props) {
            htmlElement.setAttribute(attr.toLowerCase(), props[attr]);
        }
        const htmlChildren = children.map(child => {
            if (child.props) return child.render(child.props);
            if (child.part) return child;
            console.log({ child }, child instanceof React.Component);
            return new Text(child);
        });
        htmlChildren.forEach(child => htmlElement.appendChild(child));
        return htmlElement;
    },
    useState: function(initialValue) {
        return [initialValue, function() {}];
    },
};

const ReactDOM = {
    render: function(component, htmlElement) {
        component.htmlElement = htmlElement;
        console.log(component);
        htmlElement.children.push(
            component.bind ? component() : component.render());
    }
};
React.Component.prototype.setState = function(updates) {
    this.state = Object.assign({}, this.state, updates);
    this.htmlElement.innerHTML = '';
    ReactDOM.render(this, this.htmlElement);
}

// ---

const assert = require('assert');
const useState = React.useState;

function C1() {
    const [a, setA] = useState(0);
    const [b, setB] = useState(1);
    return {
        updateA: (n) => setA(n),
        updateB: (n) => setB(n),
        render: () => new String([a, b]),
    };
}
C1.prototype = new React.Component({});

function C2() {
    const [c, setA] = useState(2);
    return {
        updateC: (n) => setC(n),
        render: () => new String(c),
    };
}
C2.prototype = new React.Component({});

function Root() {
    return React.createElement('div', undefined,
        React.createElement(C1, { name: 'World' }),
        React.createElement(C1, { name: 'Bird' }),
        React.createElement(C2));
}
Root.prototype = new React.Component({});

let c1_1Val, c1_2Val, c2Val;

const rootElem = document.getElementById('root');
ReactDOM.render(React.createElement(Root), rootElem);

assert.equal(rootElem.innerHTML, '');

c1_1Val = c1_1.render();
c1_2Val = c1_2.render();
c2Val = c2.render();
assert.equal(c1_1Val, '0,1');
assert.equal(c1_2Val, '0,1');
assert.equal(c2Val, '2');

c1_1.updateA(3);
c1_1.updateB(4);
c2.updateC(5);
c1_1Val = c1_1.render();
c1_2Val = c1_2.render();
c2Val = c2.render();
assert.equal(c1_1Val, '3,4');
assert.equal(c1_2Val, '0,1');
assert.equal(c2Val, '5');

c1_2.updateB(6);
c2.updateC(7);
c1_1Val = c1_1.render();
c2Val = c2.render();
assert.equal(c1_2Val, '0,6');
assert.equal(c2val, '7');

