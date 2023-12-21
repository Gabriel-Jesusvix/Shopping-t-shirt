
import { stripe } from '@/lib/stripe'
import { HomeContainer, Product } from "@/styles/pages/home"
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from "next/image"
import Link from 'next/link'
import Stripe from "stripe"


interface HomeProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: string
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48
    }
  })
  return (
    <>
      <Head>
        <title>Home | Shopping T-Shirt</title>
      </Head>
      <HomeContainer ref={sliderRef} className='keen-slider'>
        {
          products.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetch={false}
            >
              <Product
                className='keen-slider__slide'
              >
                <Image
                  src={product.imageUrl}
                  alt="Camiseta"
                  width={520}
                  height={520}
                />
                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          ))
        }
      </HomeContainer>
    </>

  )
}

export const getStaticProps: GetStaticProps = async ({ }) => {
  const { data } = await stripe.products.list({
    expand: ['data.default_price']
  })

  const products = data.map(product => {
    const price = product.default_price as Stripe.Price;
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: price.unit_amount && new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price.unit_amount / 100),
    }
  })

  return {
    props: {
      products
    },
    revalidate: 60 * 60 * 2 // Revalidar a cada 3 horas.
  }
}