const ReactNative = jest.requireActual('react-native');
 
ReactNative.Alert.alert = jest.fn();
ReactNative.Alert.prompt = jest.fn();
 
module.exports = ReactNative;