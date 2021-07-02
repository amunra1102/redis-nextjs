import { GetServerSideProps } from 'next';
import cache from 'utils/cache';

interface IProps {
  coupon: string | null;
  name: string
}

const Dashboard = ({ coupon, name }: IProps) => {
  return (
    <div>
      {coupon ? (
        <h1>Your coupon is {coupon}</h1>
      ) : (
        <h1>Sorry... not seeing one</h1>
      )}
      <p>{name} thanks for stopping by.</p>
    </div>
  );
};

interface IPPPData {
  ppp: {
    pppConversionFactor: number
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  const country = 'CO';


  const fetcher = async () => {
    const url = `https://api.purchasing-power-parity.com/?target=${country}`;

    const response = await fetch(url);
    const data: IPPPData = await response.json();

    const { pppConversionFactor } = data.ppp;

    console.log(new Date());

    if (pppConversionFactor < 0.25) {
      return 'PPP75';
    }

    if (pppConversionFactor < 0.5) {
      return 'PPP50';
    }

    if (pppConversionFactor < 0.75) {
      return 'PPP25';
    }

    return null;
  };

  // await cache.del(`ppp:${country}`);
  const cacheName = await cache.fetch('name', () => 'amunra', 60 * 60);
  const cachedCoupon = await cache.fetch(`ppp:${country}`, fetcher, 15);

  return {
    props: {
      coupon: cachedCoupon,
      name: cacheName
    }
  };
};

export default Dashboard;
