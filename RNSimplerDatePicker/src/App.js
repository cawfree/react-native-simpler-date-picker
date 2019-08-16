import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import Moment from 'moment';

import SimplerDatePicker from './components/SimplerDatePicker';

const styles = StyleSheet
  .create(
    {
      container: {
        width: 100,
        height: 50,
      },
    },
  );

class App extends React.Component {
  state = {
    date: Moment(),
  }
  render() {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.container,
        ]}
      >
        <SimplerDatePicker
          minDate={Moment().subtract(5, 'years')}
          maxDate={Moment().add(3, 'years')}
        />
      </View>
    );
  }
}

let hotWrapper = () => () => App;
if (Platform.OS === 'web') {
  const { hot } = require('react-hot-loader');
  hotWrapper = hot;
}
export default hotWrapper(module)(App);
