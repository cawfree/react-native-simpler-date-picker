# @cawfree/react-native-simpler-date-picker
A simple date picker component with a focus on reducing implementation complexity.

<p align="center">
  <img src="./bin/out.gif" alt="@cawfree/react-native-simpler-date-picker" width="532" height="82">
</p>

Are you using [react-native-simple-date-picker](https://github.com/cawfree/react-native-simple-date-picker)? _Don't_. It's deprecated (and overcomplicated).

## 🚀 Getting Started

Using [`npm`]():

```sh
npm install --save @cawfree/react-native-simpler-date-picker
```

Using [`yarn`]():

```sh
yarn add @cawfree/react-native-simpler-date-picker
```

## ✍️ Example

It's really simple, just make sure you have [moment.js](https://momentjs.com/docs/) installed so you can toy with the results.

```js
import SimplerDatePicker from '@cawfree/react-native-simpler-date-picker';

const App = () => (
  <SimplerDatePicker
    minDate={Moment().subtract(1, 'days')}
    maxDate={Moment().add(1, 'days')}
    onDatePicked={console.log}
  />
);

```

That's all!

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="https://www.buymeacoffee.com/cawfree">
    <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy @cawfree a coffee" width="232" height="50" />
  </a>
</p>
