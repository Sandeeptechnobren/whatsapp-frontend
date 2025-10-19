import React, { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer
      className="footer py-1 mt-1 text-bg-dark"
    >
      <div className="container text-center">
        <p>
          © 2025 <b className="text-danger">Dharma</b> SoftTech. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
