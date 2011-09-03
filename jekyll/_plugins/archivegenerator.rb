module Jekyll
  class ArchiveGenerator < Generator
    safe true

    def generate(site)
      collate_by_year(site.posts).each do |year, posts|
        page = ArchivePage.new(site, year, posts)
        site.pages << page
      end
    end

    private

    def collate_by_year(posts)
      collated = {}
      posts.each do |post|
        collated[post.date.year] ||= []
        collated[post.date.year] << post
      end
      collated
    end
  end
end
