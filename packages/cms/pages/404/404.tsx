import React from 'react'
import { Link } from 'react-router-dom'
import {
  Heading,
  Paragraph,
  Button,
  DynamicSidebar,
  PageWrapper
} from '@tensei/components'

export interface FourOhFourProps {}

const FourOhFour: React.FC<FourOhFourProps> = ({}) => (
  <PageWrapper>
    <div className="w-full flex flex-col justify-center items-center">
      <Heading>Whoops...</Heading>
      <Paragraph className="my-4">
        You seem to be lost. We're nice, so we'll help you out.
      </Paragraph>

      <Link to={window.Tensei.getPath('')}>
        <Button primary>Go home</Button>
      </Link>
    </div>
  </PageWrapper>
)

export default FourOhFour
