import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Platform,
  View,
  StyleSheet,
  Picker,
  Text,
} from 'react-native';
import Moment from 'moment';

const styles = StyleSheet
  .create(
    {
      containerStyle: {
        flex: 1,
        flexDirection: 'row',
      },
      yearStyle: {
        flex: 1,
        marginRight: 5,
      },
      monthStyle: {
        flex: 1,
        marginRight: 5,
      },
      dayStyle: {
        flex: 1,
      },
      textStyle: {
        fontSize: 16,
      },
    },
  );

const pad = (n, z) => (Array(z).join('0') + (n)).slice(-z);

class SimplerDatePicker extends React.Component {
  static getYearData = (minDate = Moment(), maxDate = Moment()) => {
    const numberOfYears = maxDate.diff(minDate, 'years', false);
    return [...Array(numberOfYears + 1)]
      .map((e, i) => Moment(minDate).add(numberOfYears - i, 'years').format('YYYY'));
  }
  static getMonthData = (minDate = Moment(), maxDate = Moment()) => {
    return Moment.months();
    //return Moment.months()
    //  .filter((e, i) => SimplerDatePicker.getDayData(minDate, maxDate, year, yearData, i).length > 0);
  };
  static getDayData = (minDate = Moment(), maxDate = Moment(), year, yearData, month) => {
    if (year < 0 || month < 0) {
      return [];
    }
    const date = Moment(`${yearData[year]}/${pad(month + 1, 2)}`);
    const daysInMonth = (year >= 0 && month >= 0) ? (date.daysInMonth()) : 0;
    if (month < 0) {
      return [];
    }
    return [...Array(daysInMonth)]
      .map((e, i) => i + 1);
      //.filter(
      //  (e, i) => {
      //    const moment = Moment(`${yearData[year]}/${pad(month + 1, 2)}/${pad(e, 2)}`);
      //    const before = moment.isBefore(maxDate);
      //    const after = moment.isAfter(minDate);
      //    return moment.isBetween(
      //      minDate,
      //      maxDate,
      //      true,
      //    );
      //  },
      //);
  };
  static getPickerItems = (prompt = 'Select Item', items = [], shouldHide = (() => false)) => {
    return [
      <Picker.Item
        value={null}
        label={prompt}
      />,
      items
        .map(
          (e, i) => (!shouldHide(e, i)) && (
            <Picker.Item
              key={e}
              label={`${e}`}
              value={i}
            />
          )
        ),
    ]
      .filter(e => !!e);
  };
  static extractStateFromMoment(moment, minDate, maxDate) {
    if (!moment) {
      return {
        year: -1,
        month: -1,
        day: -1,
      };
    }
    const yearData = SimplerDatePicker
      .getYearData(
        minDate,
        maxDate,
      );
    const year = yearData.indexOf(
      moment.format('YYYY'),
    );
    if (year < 0) {
      return {
        year: -1,
        month: -1,
        day: -1,
      };
    }
    const monthData = SimplerDatePicker
      .getMonthData(
        minDate,
        maxDate,
      );
    const month = monthData.indexOf(
      moment.format('MMMM'),
    );
    if (month < 0) {
      return {
        year,
        month: -1,
        day: -1,
      };
    }
    const dayData = SimplerDatePicker
      .getDayData(
        minDate,
        maxDate,
        year,
        yearData,
        month,
      );
    const day = dayData
      .indexOf(
        Number.parseInt(moment.format('D')),
      );
    return {
      year,
      month,
      day,
    };
  }
  static getMomentFromState = (minDate, maxDate, year, month, day) => {
    const yearData = SimplerDatePicker
      .getYearData(
        minDate,
        maxDate,
      );
    if (day >= 0 && month >= 0 && year >= 0) {
      const moment = Moment(
        `${yearData[year]}-${pad(month + 1, 2)}-${pad(day + 1, 2)}`,
        'YYYY-MM-DD',
      );
      if (SimplerDatePicker.isWithinBounds(minDate, maxDate, moment)) {
        return moment;
      }
    }
    return null;
  };
  constructor(props) {
    super(props);
    const {
      date,
      minDate,
      maxDate,
    } = props;
    console.log(maxDate);
    this.state = {
      ...SimplerDatePicker
        .extractStateFromMoment(
          date,
          minDate,
          maxDate,
        ),
    };
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      date,
      minDate,
      maxDate,
      onDatePicked,
    } = nextProps;
    const {
      day,
      month,
      year,
    } = nextState;
    const userChangedDate = (day !== this.state.day) || (month !== this.state.month) || (year !== this.state.year);
    if (!!date && (date !== this.props.date)) {
      const newState = SimplerDatePicker
        .extractStateFromMoment(
          date,
          minDate,
          maxDate,
        );
      const {
        day: newDay,
        month: newMonth,
        year: newYear,
      } = newState;
      const yearChanged = newYear !== year;
      const monthChanged = newMonth !== month;
      const dayChanged = newDay !== day;
      if (yearChanged || monthChanged || dayChanged) {
        return this.setState(
          {
            ...newState,
          },
        );
      }
    } else if (userChangedDate) {
      return onDatePicked(
        SimplerDatePicker
          .getMomentFromState(
            minDate,
            maxDate,
            year,
            month,
            day,
          ),
      );
    }
  }
  onYearPicked = (year) => {
    const {
      minDate,
      maxDate,
    } = this.props;
    const {
      month,
      day,
    } = this.state;
    const yearData = SimplerDatePicker
      .getYearData(minDate, maxDate);
    const monthData = SimplerDatePicker
      .getMonthData(minDate, maxDate);
    const monthValid = SimplerDatePicker
      .isMonthValid(
        minDate,
        maxDate,
        yearData,
        year,
        month,
      );
    const dayValid = SimplerDatePicker
      .isDayValid(
        minDate,
        maxDate,
        yearData,
        year,
        monthData,
        month,
        day,
      );
    return this.setState(
      {
        year,
        month: monthValid ? month : -1,
        day: (dayValid && monthValid) ? day : -1,
      },
    );
  }
  onMonthPicked = month => {
    const {
      minDate,
      maxDate,
    } = this.props;
    const {
      year,
      day,
    } = this.state;
    const yearData = SimplerDatePicker
      .getYearData(minDate, maxDate);
    const monthData = SimplerDatePicker
      .getMonthData(minDate, maxDate);
    const dayValid = SimplerDatePicker
      .isDayValid(
        minDate,
        maxDate,
        yearData,
        year,
        monthData,
        month,
        day,
      );
    return this.setState(
      {
        month,
        day: dayValid ? day : -1,
      },
    );
  };
  onDayPicked = day => this.setState(
    {
      day,
    },
  );
  static isMonthValid = (minDate, maxDate, yearData, year, month) => {
    const daysInMonth = SimplerDatePicker
      .getDayData(
        minDate,
        maxDate,
        year,
        yearData,
        month,
      );
    return daysInMonth.filter(
      (e, i) => SimplerDatePicker
        .isDayValid(
          minDate,
          maxDate,
          yearData,
          year,
          daysInMonth,
          month,
          i,
        )
      ).length > 0;
  };
  static isDayValid = (minDate, maxDate, yearData, year, monthData, month, day) => {
    return SimplerDatePicker
      .isWithinBounds(
        minDate,
        maxDate,
        Moment(`${yearData[year]}/${monthData[month]}/${pad(day + 1, 2)}`),
      );
  };
  static isWithinBounds = (minDate, maxDate, moment) => {
    return moment.isBetween(
      Moment(minDate).subtract(1, 'days').format('YYYY/MM/DD'),
      Moment(maxDate).add(1, 'days').format('YYYY/MM/DD'),
    );
  };
  render() {
    const {
      containerStyle,
      yearStyle,
      monthStyle,
      dayStyle,
      textStyle,
      minDate,
      maxDate,
      date,
      mode,
      getPromptString,
      yearName,
      monthName,
      dayName,
    } = this.props;
    const {
      year,
      month,
      day,
    } = this.state;
    const yearData = SimplerDatePicker
      .getYearData(
        minDate,
        maxDate,
      );
    const monthData = SimplerDatePicker
      .getMonthData(
        minDate,
        maxDate,
      );
    const dayData = SimplerDatePicker
      .getDayData(
        minDate,
        maxDate,
        year,
        yearData,
        month,
      );
    return (
      <View
        style={styles.containerStyle}
      >
        <Picker
          enabled
          value={year}
          style={[
            yearStyle,
            textStyle,
          ]}
          prompt={getPromptString(yearName)}
          mode={mode}
          onValueChange={(i) => {
            const year = Number.parseInt(i);
            return this.onYearPicked(Number.isNaN(year) ? -1 : year);
          }}
        >
          {SimplerDatePicker.getPickerItems(
            getPromptString('Year'),
            yearData,
          )}
        </Picker>
        <Picker
          enabled={!(year < 0)}
          style={monthStyle}
          mode={mode}
          value={month}
          onValueChange={(i) => {
            const month = Number.parseInt(i);
            return this.onMonthPicked(Number.isNaN(month) ? -1 : month);
          }}
        >
          {SimplerDatePicker.getPickerItems(
            getPromptString(monthName),
            monthData,
            (month, i) => !SimplerDatePicker.isMonthValid(
              minDate,
              maxDate,
              yearData,
              year,
              i,
            ),
          )}
        </Picker>
        <Picker
          enabled={!(month < 0)}
          style={dayStyle}
          mode={mode}
          value={day}
          onValueChange={(i) => {
            const day = Number.parseInt(i);
            return this.onDayPicked(Number.isNaN(day) ? -1 : day);
          }}
        >
          {SimplerDatePicker.getPickerItems(
            getPromptString(dayName),
            dayData,
            (day, i) => !SimplerDatePicker
              .isDayValid(
                minDate,
                maxDate,
                yearData,
                year,
                monthData,
                month,
                i,
              ),
          )}
        </Picker>
      </View>
    );
  }
}

SimplerDatePicker.propTypes = {
  containerStyle: PropTypes.shape({}),
  yearStyle: PropTypes.shape({}),
  monthStyle: PropTypes.shape({}),
  dayStyle: PropTypes.shape({}),
  textStyle: PropTypes.shape({}),
  minDate: PropTypes.shape({}),
  maxDate: PropTypes.shape({}),
  date: PropTypes.shape({}),
  mode: PropTypes.string,
  getPromptString: PropTypes.func,
  yearName: PropTypes.string,
  monthName: PropTypes.string,
  dayName: PropTypes.string,
  onDatePicked: PropTypes.func,
};

SimplerDatePicker.defaultProps = {
  containerStyle: styles.containerStyle,
  yearStyle: styles.yearStyle,
  monthStyle: styles.monthStyle,
  dayStyle: styles.dayStyle,
  textStyle: styles.textStyle,
  minDate: Moment().subtract(3, 'years'),
  maxDate: Moment().add(3, 'days'),
  date: null,
  mode: 'dropdown',
  getPromptString: name => `Select ${name}`,
  yearName: 'Year',
  monthName: 'Month',
  dayName: 'Day',
  onDatePicked: (moment) => {
    const date = moment && moment.format('YYYY/MM/DD');
    if (Platform.OS !== 'web') {
      Alert
        .alert(
          date,
        );
    }
    return console.log(date);
  },
};

export default SimplerDatePicker;
