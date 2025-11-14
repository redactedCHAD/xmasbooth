/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface SpinnerProps {
  spinnerClass?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ spinnerClass }) => {
  return (
    <div className={`spinner ${spinnerClass}`}></div>
  );
};

export default Spinner;