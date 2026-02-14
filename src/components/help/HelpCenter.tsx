import { useState } from 'react';
import { Search, Book, HelpCircle, MessageCircle, ExternalLink, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  articles: HelpArticle[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: <Book className="w-5 h-5" />,
    articles: [
      {
        id: 'what-is-treecovery',
        title: 'What is Treecovery?',
        content:
          'Treecovery is Kazakhstan\'s first transparent platform for monitoring urban green spaces. It allows citizens, researchers, and administrators to track trees, parks, and gardens across the country.',
        category: 'getting-started',
        tags: ['basics', 'overview'],
      },
      {
        id: 'how-to-explore',
        title: 'How to Explore the Map',
        content:
          'Click on the Map link in the navigation to view all green spaces. Use filters to narrow down by city, status, or type. Click on markers to see detailed information about each green space.',
        category: 'getting-started',
        tags: ['map', 'navigation'],
      },
      {
        id: 'reporting-issues',
        title: 'How to Report an Issue',
        content:
          'Navigate to the Report page, select the location on the map, fill in the details about the issue, and submit. Your report will be reviewed by administrators.',
        category: 'getting-started',
        tags: ['report', 'citizen'],
      },
    ],
  },
  {
    id: 'admin',
    name: 'Administrator Guide',
    icon: <HelpCircle className="w-5 h-5" />,
    articles: [
      {
        id: 'bulk-upload',
        title: 'Bulk Data Upload',
        content:
          'Use the CSV upload feature to import multiple green spaces at once. Download the template, fill in your data, and upload. The system will validate and check for duplicates automatically.',
        category: 'admin',
        tags: ['upload', 'csv', 'bulk'],
      },
      {
        id: 'manual-entry',
        title: 'Manual Entry',
        content:
          'Add individual green spaces through the manual entry form. Include photos, coordinates, species information, and other details. Photos are automatically compressed for optimal storage.',
        category: 'admin',
        tags: ['entry', 'form'],
      },
      {
        id: 'managing-records',
        title: 'Managing Records',
        content:
          'View, search, and edit green space records from the Records page. Use filters and search to find specific entries. Click on any record to view or edit details.',
        category: 'admin',
        tags: ['records', 'management'],
      },
    ],
  },
  {
    id: 'faq',
    name: 'Frequently Asked Questions',
    icon: <MessageCircle className="w-5 h-5" />,
    articles: [
      {
        id: 'data-accuracy',
        title: 'How accurate is the data?',
        content:
          'All data is verified by administrators before publication. GPS coordinates are recorded during planting, and photos provide visual verification. Citizens can also report discrepancies.',
        category: 'faq',
        tags: ['data', 'accuracy'],
      },
      {
        id: 'data-access',
        title: 'Can I download the data?',
        content:
          'Yes! All data is open and available for download. Use the export features in the admin dashboard or access the public API for programmatic access.',
        category: 'faq',
        tags: ['data', 'export', 'api'],
      },
      {
        id: 'contribute',
        title: 'How can I contribute?',
        content:
          'Citizens can report issues, adopt trees, and share photos. Administrators can upload data and manage records. Researchers can use the API for analysis.',
        category: 'faq',
        tags: ['contribute', 'community'],
      },
    ],
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // Filter articles based on search and category
  const filteredArticles = HELP_CATEGORIES.flatMap((category) => {
    if (selectedCategory && category.id !== selectedCategory) return [];
    return category.articles.filter((article) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  });

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-4 text-primary-emerald hover:text-primary-forest flex items-center gap-2"
        >
          ← Back to Help Center
        </button>
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedArticle.title}
          </h1>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find answers to common questions and learn how to use Treecovery
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary-emerald text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Categories
          </button>
          {HELP_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary-emerald text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or category filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const category = HELP_CATEGORIES.find((c) => c.id === article.category);
            return (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {category?.icon}
                    <span>{category?.name}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {article.content}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary-emerald text-sm font-medium">
                  Read more
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tutorial Reset Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Tutorial & Onboarding
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Want to see the tutorial again? You can reset it here.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('userTutorialCompleted');
                toast.success('User tutorial reset! Refresh the page and visit the home page to see it.');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-emerald text-white rounded-lg hover:bg-primary-forest transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset User Tutorial
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('adminWalkthroughCompleted');
                toast.success('Admin walkthrough reset! Refresh the page and visit the admin dashboard to see it.');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Admin Walkthrough
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('userTutorialCompleted');
                localStorage.removeItem('adminWalkthroughCompleted');
                toast.success('All tutorials reset! Refresh the page to see them.');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Tutorials
            </button>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Additional Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/faq"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">FAQ Page</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse frequently asked questions
            </p>
          </Link>
          <Link
            to="/contact"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get in touch with our team
            </p>
          </Link>
          <Link
            to="/methodology"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Methodology</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn about our data collection methods
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

