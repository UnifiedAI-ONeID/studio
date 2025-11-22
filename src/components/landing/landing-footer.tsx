import Link from 'next/link';
import AvidityLogo from '../logo';
import NewsletterSignup from './newsletter-signup';

export default function LandingFooter() {
    const sections = {
        'Explore': [
            { name: 'Events', href: '#' },
            { name: 'Places', href: '#' },
            { name: 'Community', href: '#' },
        ],
        'Company': [
            { name: 'About', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Press', href: '#' },
        ],
        'Legal': [
            { name: 'Terms', href: '#' },
            { name: 'Privacy', href: '#' },
            { name: 'Contact', href: '#' },
        ],
    };

    return (
        <footer className="bg-slate-800 text-slate-300">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <NewsletterSignup />

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                           <AvidityLogo className="h-8 w-8 text-white" />
                            <span className="font-headline text-xl font-bold tracking-tight text-white">Avidity</span>
                        </Link>
                        <p className="mt-4 text-sm text-slate-400">Connect, Discover, and Engage.</p>
                    </div>
                    {Object.entries(sections).map(([title, links]) => (
                        <div key={title}>
                            <h5 className="font-semibold text-white">{title}</h5>
                            <ul className="mt-4 space-y-2">
                                {links.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm hover:text-white hover:underline underline-offset-4">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Avidity Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
