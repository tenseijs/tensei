import React from 'react'
import ArrowIcon from 'components/ArrowIcon'
import { render } from '@testing-library/react'

test('passes down className prop to underlying svg', () => {
    const testClassName = 'TEST_CLASS_NAME'
    const { getByTestId } = render(<ArrowIcon className={testClassName} />)

    expect(getByTestId('ArrowIcon').classList.toString()).toMatch(testClassName)
})
