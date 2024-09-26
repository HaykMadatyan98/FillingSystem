export async function calculateRequiredFieldsCount(
  data: any,
  requiredFields: string[],
): Promise<number> {
  let enteredFieldsCount = 0;

  requiredFields.forEach((fieldPath) => {
    const [start, end] = fieldPath.split('.');

    if (!!data[start]) {
      if (!!data[start][end]) {
        if (
          data[start][end] !== '' ||
          data[start][end] !== null ||
          data[start][end] !== undefined
        ) {
          enteredFieldsCount++;
        }
      }
    }
  });

  return enteredFieldsCount;
}
