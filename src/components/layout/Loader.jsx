import React from 'react';
import Preloader from './Preloader';

export default function Loader({ onFinish }) {
  return <Preloader onFinish={onFinish} />;
}
