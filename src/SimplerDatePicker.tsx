import React from 'react';
import {
  Alert,
  Platform,
  View,
  StyleSheet,
  Picker,
  Text,
} from 'react-native';
import Moment from 'moment';

interface StateType {
  day: number,
  month: number,
  year: number
}
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

const pad = (n: any, z: any) => (Array(z).join('0') + (n)).slice(-z);

class SimplerDatePicker extends React.Component<PropsType, StateType> {
  static getYearData = (minDate = Moment(), maxDate = Moment()) => {
    const min = Number.parseInt(minDate.format('YYYY'));
    const max = Number.parseInt(maxDate.format('YYYY'));
    return [
      max,
      ...(
        [...Array(max - min)]
          .map(
            (e, i, arr) => ((max - i)),
          )
      ),
      min,
    ]
      .filter((e, i, arr) => arr.indexOf(e) === i)
      .map(e => `${e}`);
  }
  static getMonthData = (minDate = Moment(), maxDate = Moment()) => {
    return Moment.months();
  };
  static getDayData = (minDate = Moment(), maxDate = Moment(), year: number, yearData: string[], month: number) => {
    if (year < 0 || month < 0) {
      return [];
    }
    const date = Moment(`${yearData[year]}-${pad(month + 1, 2)}-01`);
    const daysInMonth = (year >= 0 && month >= 0) ? (date.daysInMonth()) : 0;
    return [...Array(daysInMonth)]
      .map((e, i) => (i + 1).toString());
  };
  static isMonthValid = (minDate: moment.Moment, maxDate: moment.Moment, yearData: string[], year: number, month: number) => {
    if (year < 0 || month < 0) {
      return false;
    }
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
    return dayData
      .reduce(
        (res, day, i) => res || SimplerDatePicker
          .isDayValid(
            minDate,
            maxDate,
            yearData,
            year,
            monthData,
            month,
            i,
          ),
        false,
      );
  };
  static isDayValid = (minDate: moment.Moment, maxDate: moment.Moment, yearData: string[], year: number, monthData: string[], month: number, day: number) => {
    if (year < 0 || month < 0 || day < 0) {
      return false;
    }
    return SimplerDatePicker
      .isWithinBounds(
        minDate,
        maxDate,
        Moment(`${yearData[year]}/${pad(month + 1, 2)}/${pad(day + 1, 2)}`, 'YYYY/MM/DD'),
      );
  };
  static isWithinBounds = (minDate: moment.Moment, maxDate: moment.Moment, moment: moment.Moment) => {
    const min = Moment(minDate).subtract(1, 'days');
    const max = Moment(maxDate).add(1, 'days');
    return moment.isBetween(
      minDate,
      maxDate,
      //min,
      //max,
      null,
      '[]',
    );
  };
  static getPickerItems = (prompt = 'Select Item', items: string[] = [], shouldHide: ((itemString: string, ItemIndex: number) => boolean) = (() => false), pickerProps = {}) => {
    return [
      <Picker.Item
        {...pickerProps}
        value={null}
        label={prompt}
        key={prompt}
      />,
      items
        .map(
          (e, i) => (!shouldHide(e, i)) && (
            <Picker.Item
              {...pickerProps}
              key={e}
              label={`${e}`}
              value={i}
            />
          )
        ),
    ]
      .filter(e => !!e);
  };
  static extractStateFromMoment(moment: moment.Moment | null, minDate?: moment.Moment, maxDate?: moment.Moment): StateType {
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
        moment.format('D')
      );
    return {
      year,
      month,
      day,
    };
  }
  static getMomentFromState = (minDate: moment.Moment, maxDate: moment.Moment, year: number, month: number, day: number) => {
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
  constructor(props: PropsType = new PropsType()) {
    super(props);
    const {
      date,
      minDate,
      maxDate,
    } = props;
    this.state = {
      ...SimplerDatePicker
        .extractStateFromMoment(
          date,
          minDate,
          maxDate,
        ),
    };
  }
  //componentDidMount() {
  //  // XXX: Force the caller to sync with the currently selected
  //  //      date. This is important for times where the date has
  //  //      been selected, but it is invalid given the range.
  //  const { minDate, maxDate, onDatePicked } = this.props;
  //  const { year, month, day } = this.state;
  //  return onDatePicked(
  //    SimplerDatePicker
  //      .getMomentFromState(
  //        minDate,
  //        maxDate,
  //        year,
  //        month,
  //        day,
  //      ),
  //  );
  //}
  componentDidUpdate(prevProps: PropsType, prevState: { day: number, month: number, year: number }) {
    const {
      date,
      minDate,
      maxDate,
      onDatePicked,
    } = this.props;
    const {
      day,
      month,
      year,
    } = this.state;
    const userChangedDate = (day !== prevState.day) || (month !== prevState.month) || (year !== prevState.year);
    if (!!date && (date !== prevProps.date)) {
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
  onYearPicked = (year: number) => {
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
  onMonthPicked = (month: number) => {
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
  onDayPicked = (day: number) => this.setState(
    {
      day,
    },
  );
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
      yearPickerProps,
      monthPickerProps,
      dayPickerProps,
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
        style={containerStyle}
      >
        <Picker
          enabled
          selectedValue={year.toString()}
          // value={year}
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
            undefined,
            yearPickerProps,
          )}
        </Picker>
        <Picker
          enabled={!(year < 0)}
          style={monthStyle}
          mode={mode}
          // value={month}
          selectedValue={month.toString()}
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
            monthPickerProps,
          )}
        </Picker>
        <Picker
          enabled={!(month < 0)}
          style={dayStyle}
          mode={mode}
          // value={day}
          selectedValue={day.toString()}
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
            dayPickerProps,
          )}
        </Picker>
      </View>
    );
  }
}

export class PropsType {
  containerStyle = styles.containerStyle;
  yearStyle = styles.yearStyle;
  monthStyle = styles.monthStyle;
  dayStyle = styles.dayStyle;
  textStyle = styles.textStyle;
  minDate: moment.Moment = Moment().subtract(1, 'years');
  maxDate: moment.Moment = Moment().add(1, 'years');
  date: moment.Moment | null = null;
  mode: 'dialog' | 'dropdown' = 'dropdown';
  getPromptString = (name: string) => `Select ${name}`;
  yearName = 'Year';
  monthName = 'Month';
  dayName = 'Day';
  onDatePicked = (moment: moment.Moment | null) => {
    const date = moment && moment.format('YYYY/MM/DD');
    if (Platform.OS !== 'web') {
      Alert
        .alert(
          date || ""
        );
    }
    return console.log(date);
  };
  yearPickerProps = {};
  monthPickerProps = {};
  dayPickerProps = {};
};

export default SimplerDatePicker;
