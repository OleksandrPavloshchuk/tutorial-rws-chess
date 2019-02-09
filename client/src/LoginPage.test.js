import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import LoginPage from './LoginPage';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LoginPage />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('starts with empty password and login', () => {
  const component = renderer.create(<LoginPage />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  
  console.log('component', component.toJSON());
  
  // expect(tree.state.login).toEqual("1");
  
});
