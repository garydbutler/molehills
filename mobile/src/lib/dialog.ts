/*
  Cross-platform prompts.

  react-native-web ships `Alert` as a literal no-op (`static alert() {}`), so
  any decision routed through Alert silently does nothing in the browser —
  the user taps and the app appears frozen. Anything that gates a real choice
  has to go through here instead.
*/
import { Alert, Platform } from "react-native";

/*
  Ask a question. Resolves with the index of the chosen option.

  IMPORTANT: options[0] is the primary/confirm action. On web this maps to
  window.confirm, which only offers OK (0) and Cancel (last index), so keep
  asks to two options.
*/
export function ask(
  title: string,
  message: string,
  options: string[],
): Promise<number> {
  if (Platform.OS === "web") {
    const confirmed = globalThis.confirm?.(`${title}\n\n${message}`) ?? false;
    return Promise.resolve(confirmed ? 0 : options.length - 1);
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      options.map((text, i) => ({ text, onPress: () => resolve(i) })),
      { cancelable: false },
    );
  });
}

/* Say something. Nothing to decide. */
export function tell(title: string, message: string) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message, [{ text: "OK" }]);
}
