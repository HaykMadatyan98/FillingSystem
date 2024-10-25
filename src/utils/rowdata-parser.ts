const findSectionsIndices = (headers) => {
  let applicantStartIndex = -1;
  let applicantEndIndex = -1;
  let ownerStartIndex = -1;
  let ownerEndIndex = -1;

  for (let i = 0; i < headers.length; i++) {
    if (headers[i].startsWith('Applicant')) {
      if (applicantStartIndex === -1) {
        applicantStartIndex = i;
      }
      applicantEndIndex = i;
    } else if (headers[i].startsWith('Owner')) {
      if (ownerStartIndex === -1) {
        ownerStartIndex = i;
      }
      ownerEndIndex = i;
    }
  }

  return {
    applicantStartIndex,
    applicantEndIndex,
    ownerStartIndex,
    ownerEndIndex,
  };
};

export const filterApplicantAndOwnerRowData = (rowData: any) => {
  const rowDataValues: string[][] = Object.values(rowData);
  const rowDataKeys: string[] = Object.keys(rowData);
  const {
    applicantEndIndex,
    applicantStartIndex,
    ownerEndIndex,
    ownerStartIndex,
  } = findSectionsIndices(rowDataKeys);

  if (applicantStartIndex !== -1 && applicantEndIndex !== -1) {
    const applicantDataKeys = rowDataKeys.slice(
      applicantStartIndex,
      applicantEndIndex + 1,
    );
    const applicantDataValues = rowDataValues.slice(
      applicantStartIndex,
      applicantEndIndex + 1,
    );

    const hasNonEmptyApplicant = applicantDataValues.some((values) =>
      values.some((val) => val !== ''),
    );

    if (hasNonEmptyApplicant) {
      applicantDataKeys.forEach((key) => {
        rowData[key] = rowData[key].filter((val) => val !== '');
      });
    } else {
      applicantDataKeys.forEach((key) => delete rowData[key]);
    }
  }

  if (ownerStartIndex !== -1 && ownerEndIndex !== -1) {
    const ownerDataKeys = rowDataKeys.slice(ownerStartIndex, ownerEndIndex + 1);
    const ownerDataValues = rowDataValues.slice(
      ownerStartIndex,
      ownerEndIndex + 1,
    );

    const hasNonEmptyOwner = ownerDataValues.some((values) =>
      values.some((val) => val !== ''),
    );

    if (hasNonEmptyOwner) {
      ownerDataKeys.forEach((key) => {
        rowData[key] = rowData[key].filter((val) => val !== '');
      });
    } else {
      ownerDataKeys.forEach((key) => delete rowData[key]);
    }
  }
};
